export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormMessages {
  sending: string;
  success: string;
  error: string;
  networkError: string;
}

export interface FormStatus {
  state: 'idle' | 'sending' | 'success' | 'error';
  message: string;
}

export async function submitContactForm(
  data: ContactFormData,
  messages: ContactFormMessages,
  onStatusChange: (status: FormStatus) => void,
): Promise<void> {
  onStatusChange({ state: 'sending', message: messages.sending });

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      onStatusChange({ state: 'success', message: messages.success });
    } else {
      onStatusChange({
        state: 'error',
        message: result.error || messages.error,
      });
    }
  } catch {
    onStatusChange({ state: 'error', message: messages.networkError });
  }
}
