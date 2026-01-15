import { InvoiceLineItemDetailView } from 'src/sections/invoice-line-items/view';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: 'Invoice line item',
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <InvoiceLineItemDetailView id={id} />;
}
