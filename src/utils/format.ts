export const pad = (value: number) => String(value).padStart(2, "0");

export const formatBRL = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatCount = (value: number) => value.toLocaleString("pt-BR");

export const formatMillions = (value: number) => {
  if (value >= 1e6) return `R$ ${(value / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${value < 2e6 ? "milhão" : "milhões"}`;
  if (value >= 1e3) return `R$ ${(value / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
  return formatBRL(value);
};

// CAIXA dates are dd/mm/yyyy.
export const formatWeekday = (date: string) => {
  const [day, month, year] = date.split("/").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", { weekday: "long" });
};
