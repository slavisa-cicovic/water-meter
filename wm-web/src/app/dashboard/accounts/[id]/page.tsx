import { AccountEditView } from 'src/sections/accounts/view';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: 'Account Details',
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <AccountEditView id={id} />;
}
