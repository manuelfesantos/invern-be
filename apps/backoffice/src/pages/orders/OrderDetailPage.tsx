import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Card, ErrorState, LoadingState } from "../../components/ui";
import { formatDate, formatPrice, shortId } from "../../lib/format";
import { fulfillmentBadge, paymentBadge } from "./order-status";

async function fetchOrder(id: string) {
  const { data, error } = await api.GET("/private/orders/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data.data;
}
type Order = NonNullable<Awaited<ReturnType<typeof fetchOrder>>>;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-800">{value}</span>
    </div>
  );
}

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const { data: order, isLoading, isError, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });

  if (isLoading) return <LoadingState />;
  if (isError || !order) return <ErrorState onRetry={() => void refetch()} />;

  const o: Order = order;
  const payment = paymentBadge(o.payment?.state);
  const fulfillment = fulfillmentBadge(o.shippingTransaction?.status);
  const method = o.payment?.paymentMethod;
  const shipping = o.shippingMethod?.rate?.priceInCents ?? 0;

  return (
    <div className="space-y-4">
      <div>
        <Link to="/orders" className="text-sm text-slate-500 hover:underline">
          ← Orders
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-lg font-bold text-slate-900">
            {shortId(o.id)}
          </h1>
          <p className="text-sm text-slate-500">{formatDate(o.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {o.isCanceled && <Badge variant="danger">Canceled</Badge>}
          <Badge variant={payment.variant}>Payment: {payment.label}</Badge>
          <Badge variant={fulfillment.variant}>
            Fulfillment: {fulfillment.label}
          </Badge>
        </div>
      </div>

      {/* Line items */}
      <Section title="Items">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-1 pr-4 font-medium">Product</th>
                <th className="py-1 pr-4 text-right font-medium">Qty</th>
                <th className="py-1 pr-4 text-right font-medium">Unit</th>
                <th className="py-1 text-right font-medium">Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {o.products.map((p, i) => (
                <tr key={p.id ?? i}>
                  <td className="py-2 pr-4 text-slate-800">{p.name}</td>
                  <td className="py-2 pr-4 text-right text-slate-600">
                    {p.quantity}
                  </td>
                  <td className="py-2 pr-4 text-right text-slate-600">
                    {formatPrice(p.priceInCents ?? 0)}
                  </td>
                  <td className="py-2 text-right text-slate-800">
                    {formatPrice((p.priceInCents ?? 0) * p.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Totals */}
        <Section title="Summary">
          <Field
            label="Subtotal (net)"
            value={formatPrice(o.payment?.netAmount ?? 0)}
          />
          <Field label="Shipping" value={formatPrice(shipping)} />
          <div className="mt-1 border-t border-slate-100 pt-1">
            <Field
              label="Total"
              value={
                <span className="font-semibold">
                  {formatPrice(o.payment?.grossAmount ?? 0)}
                </span>
              }
            />
          </div>
        </Section>

        {/* Payment */}
        <Section title="Payment">
          <Field
            label="Status"
            value={<Badge variant={payment.variant}>{payment.label}</Badge>}
          />
          <Field
            label="Method"
            value={
              method
                ? `${method.brand ?? method.type ?? "—"}${
                    method.last4 ? ` •••• ${method.last4}` : ""
                  }`
                : "—"
            }
          />
        </Section>

        {/* Customer */}
        <Section title="Customer">
          <Field
            label="Name"
            value={
              `${o.personalDetails?.firstName ?? ""} ${
                o.personalDetails?.lastName ?? ""
              }`.trim() || "—"
            }
          />
          <Field label="Email" value={o.personalDetails?.email ?? "—"} />
        </Section>

        {/* Shipping address + transaction */}
        <Section title="Shipping">
          <div className="text-sm text-slate-800">
            {o.address ? (
              <>
                <div>
                  {o.address.street} {o.address.houseNumber}
                  {o.address.apartment ? `, ${o.address.apartment}` : ""}
                </div>
                <div>
                  {o.address.postalCode} {o.address.city}
                  {o.address.province ? `, ${o.address.province}` : ""}
                </div>
                <div>{o.address.country}</div>
              </>
            ) : (
              "—"
            )}
          </div>
          <div className="mt-3 border-t border-slate-100 pt-2">
            <Field label="Method" value={o.shippingMethod?.name ?? "—"} />
            <Field
              label="Status"
              value={
                <Badge variant={fulfillment.variant}>{fulfillment.label}</Badge>
              }
            />
            <Field
              label="Tracking"
              value={
                o.shippingTransaction?.trackingUrl ? (
                  <a
                    href={o.shippingTransaction.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-900 underline"
                  >
                    Track
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
