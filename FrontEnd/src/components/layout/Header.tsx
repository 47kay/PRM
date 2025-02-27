interface HeaderProps {
  currentRoute: string;
}

const Header = ({ currentRoute }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          {currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)}
        </h2>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            New Contact
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;