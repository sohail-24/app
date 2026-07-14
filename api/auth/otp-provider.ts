export type OtpDelivery = {
  mobileNumber: string;
  code: string;
};

export interface OtpProvider {
  sendOtp(delivery: OtpDelivery): Promise<void>;
}

class MockOtpProvider implements OtpProvider {
  async sendOtp({ mobileNumber, code }: OtpDelivery) {
    console.info(`[mock-otp] ${mobileNumber}: ${code}`);
  }
}

export const otpProvider: OtpProvider = new MockOtpProvider();
