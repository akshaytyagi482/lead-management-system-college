import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const PageWrapper = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Navbar */}
        <div className="h-16 bg-white shadow-md px-6 flex items-center">
          <Navbar />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default PageWrapper;
