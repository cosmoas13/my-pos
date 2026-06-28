import {
  PaymentMethod,
  Prisma,
  SaleStatus,
} from "@/generated/prisma/client";

export const PAGE_SIZE = 20;

export type TransactionFilters = {
  q: string;
  status: string;
  paymentMethod: string;
  from: string;
  to: string;
};

function getStringParam(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string
) {
  if (params instanceof URLSearchParams) {
    return params.get(key)?.trim() ?? "";
  }

  const value = params[key];
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function startOfDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function endOfDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return date;
}

export function getTransactionFilters(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): TransactionFilters {
  return {
    q: getStringParam(params, "q"),
    status: getStringParam(params, "status"),
    paymentMethod: getStringParam(params, "paymentMethod"),
    from: getStringParam(params, "from"),
    to: getStringParam(params, "to"),
  };
}

export function getPageParam(
  params: URLSearchParams | Record<string, string | string[] | undefined>
) {
  const page = Number(getStringParam(params, "page") || 1);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export function buildTransactionWhere(filters: TransactionFilters) {
  const where: Prisma.SaleWhereInput = {};

  if (filters.status in SaleStatus) {
    where.status = filters.status as SaleStatus;
  }

  if (filters.paymentMethod in PaymentMethod) {
    where.paymentMethod = filters.paymentMethod as PaymentMethod;
  }

  const from = startOfDate(filters.from);
  const to = endOfDate(filters.to);

  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lt: to } : {}),
    };
  }

  if (filters.q) {
    where.OR = [
      { invoiceNumber: { contains: filters.q, mode: "insensitive" } },
      { cashier: { is: { name: { contains: filters.q, mode: "insensitive" } } } },
      {
        customer: {
          is: { name: { contains: filters.q, mode: "insensitive" } },
        },
      },
      {
        items: {
          some: {
            OR: [
              { productName: { contains: filters.q, mode: "insensitive" } },
              { sku: { contains: filters.q, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  return where;
}

export function getQueryString(
  filters: TransactionFilters,
  page?: number,
  extra?: Record<string, string>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
