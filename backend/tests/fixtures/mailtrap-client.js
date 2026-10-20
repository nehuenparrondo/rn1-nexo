export const state = { clients: [], messages: [], fail: false };

export class MailtrapClient {
  constructor(options) {
    state.clients.push(options);
  }
  async send(message) {
    if (state.fail) throw new Error('Fallo simulado de Mailtrap');
    state.messages.push(message);
    return { success: true };
  }
}
