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
    render(
      <CaptchaWidget
        siteKey="public-site-key"
        resetKey={0}
        onToken={onToken}
        onError={onError}
      />,
    );

    await waitFor(() => expect(widgetOptions).not.toBeNull());
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
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Reintentar CAPTCHA' })).not.toBeInTheDocument());
  });
});
