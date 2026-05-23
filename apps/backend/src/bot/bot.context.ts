import type { Scenes } from 'telegraf';

export interface RegistrationState {
  residentType?: 'student' | 'tenant';
  name?: string;
  dormitoryId?: number;
  roomNumber?: string;
  email?: string;
  userId?: string;
}

export interface AccountRecoveryState {
  userId?: string;
}

export interface SubmitTicketState {
  specialistId?: number;
  specialistName?: string;
  description?: string;
}

export interface BotSession extends Scenes.WizardSessionData {
  pendingUserId?: string;
}

export type BotContext = Scenes.WizardContext & {
  session: BotSession;
  wizard: Scenes.WizardContext['wizard'] & {
    state: RegistrationState & SubmitTicketState;
  };
};
