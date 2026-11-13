const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
});

export const formatNaira = (amount: number) => naira.format(amount);

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
