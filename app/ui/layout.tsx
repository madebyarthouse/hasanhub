import Header from "~/ui/header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-10">
      <Header />
      <main className="mx-auto items-start px-5 lg:px-10 xl:px-14  w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;
