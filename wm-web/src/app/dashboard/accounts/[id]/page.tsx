import { AccountDetailView } from 'src/sections/accounts/view';

type Props = {
  params: { id: string };
};

export const metadata = {
  title: 'Account Details',
};

export default function Page({ params }: Props) {
  return <AccountDetailView id={params.id} />;
}
