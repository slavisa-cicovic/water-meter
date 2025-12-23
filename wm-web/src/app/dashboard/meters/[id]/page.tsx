import { MeterDetailView } from 'src/sections/meters/view';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: 'Meter',
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <MeterDetailView id={id} />;
}
