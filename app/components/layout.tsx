import Header from "~/components/header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="mx-auto items-start px-0 lg:px-10 xl:px-14 flex flex-col lg:flex-row relative lg:gap-20">
        {children}
      </main>
    </>
  );
};

export default Layout;
