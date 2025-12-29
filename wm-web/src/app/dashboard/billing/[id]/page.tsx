import { InvoiceDetailView } from 'src/sections/billing/view';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: 'Invoice',
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <InvoiceDetailView id={id} />;
}
