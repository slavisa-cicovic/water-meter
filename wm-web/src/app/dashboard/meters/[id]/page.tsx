import { MeterDetailView } from 'src/sections/meters/view';

type Props = {
  params: { id: string };
};

export const metadata = {
  title: 'Meter',
};

export default function Page({ params }: Props) {
  return <MeterDetailView id={params.id} />;
}

