import Link from "next/link";

export default function HomePage() {
  const pages = [
    { title: "All Buyers", href: "/buyers" },
    { title: "Add New Buyer", href: "/buyers/new" },
    { title: "Import Buyers (CSV)", href: "/buyers/import" },
    // Add any other pages you implemented
  ];

  return (
    <div>
      <h2>Welcome to the Buyer Leads Dashboard</h2>
      <p>Click on a page to navigate:</p>

      <ul>
        {pages.map((page) => (
          <li key={page.href} style={{ marginBottom: "8px" }}>
            <Link
              href={page.href}
              style={{
                textDecoration: "none",
                color: "blue",
                fontWeight: "bold",
              }}
            >
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
