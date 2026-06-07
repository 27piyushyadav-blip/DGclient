export type MobileBookingParams = {
  flow?: "service-first" | "staff-first";
  step?: number;
  service?: string;
  staff?: string;
};

export function buildMobileBookingHref(
  venueId: string,
  params: MobileBookingParams = {},
) {
  const searchParams = new URLSearchParams();

  if (params.flow) searchParams.set("flow", params.flow);
  if (typeof params.step === "number") searchParams.set("step", String(params.step));
  if (params.service) searchParams.set("service", params.service);
  if (params.staff) searchParams.set("staff", params.staff);

  const query = searchParams.toString();
  return `/main/mobile/booking/${venueId}${query ? `?${query}` : ""}`;
}
