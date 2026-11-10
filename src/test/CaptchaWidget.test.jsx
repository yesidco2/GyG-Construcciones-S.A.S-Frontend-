import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CaptchaWidget from '../components/auth/CaptchaWidget';

describe('CaptchaWidget', () => {
  let widgetOptions;
  let reset;
  let remove;

  beforeEach(() => {
    widgetOptions = null;
    reset = vi.fn();
    remove = vi.fn();
    const script = document.createElement('script');
    script.id = 'gg-turnstile-script';
    script.dataset.loaded = 'true';
    document.head.appendChild(script);
    window.turnstile = {
      render: vi.fn((_container, options) => {
        widgetOptions = options;
        return 'widget-id';
      }),
      reset,
      remove,
    };
  });

  afterEach(() => {
    delete window.turnstile;
    document.getElementById('gg-turnstile-script')?.remove();
  });

  it('shows the provider error code and lets the user retry the widget', async () => {
    const onToken = vi.fn();
    const onError = vi.fn();
    const { rerender } = render(
      <CaptchaWidget
        siteKey="public-site-key"
        action="login"
        resetKey={0}
        onToken={onToken}
        onError={onError}
      />,
    );

    await waitFor(() => expect(widgetOptions).not.toBeNull());
    expect(widgetOptions.action).toBe('login');
    widgetOptions['error-callback']('300010');

    expect(onToken).toHaveBeenLastCalledWith('');
    expect(onError).toHaveBeenLastCalledWith(expect.stringContaining('300010'));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Reintentar CAPTCHA' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar CAPTCHA' }));

    expect(reset).toHaveBeenCalledWith('widget-id');
    expect(onError).toHaveBeenLastCalledWith('');
    widgetOptions.callback('fresh-token');
    expect(onToken).toHaveBeenLastCalledWith('fresh-token');
    rerender(
      <CaptchaWidget
        siteKey="public-site-key"
        action="login"
        resetKey={1}
        onToken={onToken}
        onError={onError}
      />,
    );
    expect(reset).toHaveBeenLastCalledWith('widget-id');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Reintentar CAPTCHA' })).not.toBeInTheDocument());
  });

  it('retries a stale script tag when the Turnstile API is missing', async () => {
    const onToken = vi.fn();
    const onError = vi.fn();
    delete window.turnstile;
    render(
      <CaptchaWidget
        siteKey="public-site-key"
        action="login"
        resetKey={0}
        onToken={onToken}
        onError={onError}
      />,
    );

    const script = document.getElementById('gg-turnstile-script');
    await waitFor(() => expect(script).not.toHaveAttribute('data-loaded', 'true'));
    fireEvent.load(script);
    await screen.findByRole('button', { name: 'Reintentar CAPTCHA' });

    window.turnstile = {
      render: vi.fn((_container, options) => {
        widgetOptions = options;
        return 'widget-id';
      }),
      reset,
      remove,
    };
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar CAPTCHA' }));

    await waitFor(() => expect(widgetOptions).not.toBeNull());
    expect(onError).toHaveBeenLastCalledWith('');
  });
});
