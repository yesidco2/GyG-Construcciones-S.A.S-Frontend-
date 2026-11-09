import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Contact from '../components/Contact';
import FloatingIA from '../components/FloatingIA';
import Footer from '../components/Footer';
import { apiFetch } from '../services/api';

vi.mock('../services/api', () => ({ apiFetch: vi.fn() }));
vi.mock('../components/auth/CaptchaWidget', () => ({
  default: ({ onToken, resetKey }) => (
    <button type="button" onClick={() => onToken('captcha-test-token')}>
      Complete CAPTCHA {resetKey}
    </button>
  ),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('Privacy consent in contact and newsletter', () => {
  it('blocks contact without consent and announces the accessible error', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo'), 'ana@example.com');
    await user.selectOptions(screen.getByLabelText('Tipo de Servicio'), 'Obra Civil');
    await user.type(screen.getByLabelText('Tu consulta'), 'Necesito una cotización para una obra.');
    await user.click(screen.getByRole('button', { name: /Complete CAPTCHA/ }));
    await user.click(screen.getByRole('button', { name: 'Enviar Solicitud' }));

    const error = await screen.findByText('Debes autorizar el tratamiento de tus datos para enviar la solicitud.');
    expect(error).toHaveAttribute('role', 'alert');
    expect(error).toHaveAttribute('aria-live', 'polite');
    expect(screen.getByLabelText(/Autorizo de manera previa/)).toHaveAttribute('aria-invalid', 'true');
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('sends contact consent and the configured policy version', async () => {
    const user = userEvent.setup();
    apiFetch.mockResolvedValueOnce({});
    render(<Contact />);

    await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez');
    await user.type(screen.getByLabelText('Correo'), 'ana@example.com');
    await user.selectOptions(screen.getByLabelText('Tipo de Servicio'), 'Obra Civil');
    await user.type(screen.getByLabelText('Tu consulta'), 'Necesito una cotización para una obra.');
    await user.click(screen.getByRole('button', { name: /Complete CAPTCHA/ }));
    await user.click(screen.getByLabelText(/Autorizo de manera previa/));
    await user.click(screen.getByRole('button', { name: 'Enviar Solicitud' }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
    const [, options] = apiFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toMatchObject({
      aceptaPolitica: true,
      politicaVersion: expect.any(String),
    });
  });

  it('does not couple the contact checkbox to newsletter consent', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Contact />
        <Footer />
      </>,
    );
    const contactConsent = screen.getByLabelText(/Autorizo de manera previa/);
    const newsletterConsent = screen.getByLabelText(/Autorizo a G&G CONSTRUCCIONES SST S\.A\.S\./);

    expect(contactConsent).not.toBeChecked();
    expect(newsletterConsent).not.toBeChecked();
    await user.click(contactConsent);

    expect(contactConsent).toBeChecked();
    expect(newsletterConsent).not.toBeChecked();
  });

  it('keeps newsletter consent independent and includes it in the subscription payload', async () => {
    const user = userEvent.setup();
    apiFetch.mockResolvedValueOnce({});
    render(<Footer />);

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: /Complete CAPTCHA/ }));
    await user.click(screen.getByRole('button', { name: 'Suscribirme al boletín' }));
    expect(await screen.findByText('Debes autorizar el tratamiento de tus datos para suscribirte.'))
      .toHaveAttribute('role', 'alert');
    expect(apiFetch).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText(/Autorizo a G&G CONSTRUCCIONES SST S\.A\.S\./));
    await user.click(screen.getByRole('button', { name: 'Suscribirme al boletín' }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledTimes(1));
    const [, options] = apiFetch.mock.calls[0];
    expect(JSON.parse(options.body)).toMatchObject({
      aceptaPolitica: true,
      politicaVersion: expect.any(String),
    });
  });
});

describe('Chat privacy notice', () => {
  it('shows the notice before chat messages and sends policyVersion with the message', async () => {
    const user = userEvent.setup();
    apiFetch.mockResolvedValueOnce({ respuesta: 'Respuesta de prueba' });
    render(<FloatingIA />);
    await user.click(screen.getByRole('button', { name: 'Abrir asistente IA' }));

    const notice = screen.getByText(/Sus mensajes se registran para responderle/);
    const greeting = screen.getByText(/Hola — soy el asistente virtual/);
    expect(notice.compareDocumentPosition(greeting) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.type(screen.getByLabelText('Mensaje para el asistente'), 'Consulta de prueba');
    await user.click(screen.getByRole('button', { name: 'Enviar' }));

    await waitFor(() => expect(apiFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
    })));
    expect(JSON.parse(apiFetch.mock.calls[0][1].body)).toMatchObject({
      pregunta: 'Consulta de prueba',
      politicaVersion: expect.any(String),
    });
  });
});

describe('Privacy policy page', () => {
  it('shows draft notice and all section links when the configured version is a draft', async () => {
    vi.stubEnv('VITE_PRIVACY_POLICY_VERSION', '1.0-borrador');
    vi.stubEnv('VITE_PRIVACY_POLICY_EFFECTIVE_DATE', '2026-01-15');
    vi.resetModules();
    const { default: PrivacyPolicyPage } = await import('../pages/PrivacyPolicyPage');
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'BORRADOR – pendiente de revisión y aprobación por G&G Construcciones S.A.S.',
    );
    expect(screen.getByText('Los campos marcados como [COMPLETAR] aún no se han llenado.')).toBeInTheDocument();
    expect(screen.getByText('2026-01-15')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^\d+\./ })).toHaveLength(13);
  });

  it('hides the draft notice for version 1.0 and links the footer to the policy route', async () => {
    vi.stubEnv('VITE_PRIVACY_POLICY_VERSION', '1.0');
    vi.resetModules();
    const { default: PrivacyPolicyPage } = await import('../pages/PrivacyPolicyPage');
    const { default: FooterPage } = await import('../components/Footer');
    const { unmount } = render(<PrivacyPolicyPage />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('1.0')).toBeInTheDocument();
    unmount();

    render(<FooterPage />);
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByRole('link', { name: 'Política de tratamiento de datos' }))
      .toHaveAttribute('href', '#politica-datos');
  });
});
