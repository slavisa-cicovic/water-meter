import { InvoiceDetailView } from 'src/sections/billing/view';

type Props = {
  params: { id: string };
};

export const metadata = {
  title: 'Invoice',
};

export default function Page({ params }: Props) {
  return <InvoiceDetailView id={params.id} />;
}

