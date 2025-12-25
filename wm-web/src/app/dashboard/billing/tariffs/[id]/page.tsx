import { TariffDetailView } from 'src/sections/billing/view/tariff-detail-view';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: 'Tariff',
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <TariffDetailView id={id} />;
}
