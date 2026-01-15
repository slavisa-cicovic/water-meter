import { InvoiceLineItemCreateView } from 'src/sections/invoice-line-items/view';

export const metadata = {
  title: 'New invoice line item',
};

export default function Page() {
  return <InvoiceLineItemCreateView />;
}
