/**
 * La liste ({children}) reste affichée pendant que le panneau ({modal}) se
 * superpose. Le slot `modal` est vide en dehors des routes interceptées.
 */
export default function MessagesLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
