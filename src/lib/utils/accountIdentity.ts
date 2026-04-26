type AccountIdentityInput = {
  email?: string | null;
};

const DREAMLEDGE_EMAIL = "dreamledge@gmail.com";
const SOSA_EMAIL = "aaron.walker4@gmail.com";
const REAL_ADMIN_EMAILS = new Set([DREAMLEDGE_EMAIL, SOSA_EMAIL]);

function normalizeEmail(email?: string | null) {
  return (email ?? "").trim().toLowerCase();
}

export function isDreamledgeAccount(input: AccountIdentityInput) {
  return normalizeEmail(input.email) === DREAMLEDGE_EMAIL;
}

export function isRealAdminAccount(input: AccountIdentityInput) {
  return REAL_ADMIN_EMAILS.has(normalizeEmail(input.email));
}

export function isAlwaysVerifiedAccount(input: AccountIdentityInput) {
  return isDreamledgeAccount(input);
}
