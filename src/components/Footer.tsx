export default function Footer() {
  return (
    <footer className="mt-4 bg-gray-200 text-center py-2.5">
      <p className="font-sans">&copy; {process.env.COPYRIGHT}</p>
    </footer>
  );
}
