import type { APIRoute } from "astro";

export const prerender = false;

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
  address: {
    city: string;
    street: string;
  };
}

// Dummy users data
const dummyUsers: User[] = [
  {
    id: 1,
    name: "Jan Kowalski",
    email: "jan.kowalski@example.com",
    phone: "+48 123 456 789",
    website: "jankowalski.pl",
    company: {
      name: "Tech Solutions",
    },
    address: {
      city: "Warszawa",
      street: "ul. Piękna 15",
    },
  },
  {
    id: 2,
    name: "Anna Nowak",
    email: "anna.nowak@example.com",
    phone: "+48 987 654 321",
    website: "annanowak.dev",
    company: {
      name: "Digital Agency",
    },
    address: {
      city: "Kraków",
      street: "ul. Floriańska 3",
    },
  },
  {
    id: 3,
    name: "Piotr Wiśniewski",
    email: "piotr.wisniewski@example.com",
    phone: "+48 555 666 777",
    website: "piotrw.com",
    company: {
      name: "StartupLab",
    },
    address: {
      city: "Gdańsk",
      street: "ul. Długa 22",
    },
  },
  {
    id: 4,
    name: "Maria Wójcik",
    email: "maria.wojcik@example.com",
    phone: "+48 444 333 222",
    website: "mariawojcik.net",
    company: {
      name: "Creative Studio",
    },
    address: {
      city: "Wrocław",
      street: "ul. Świdnicka 8",
    },
  },
  {
    id: 5,
    name: "Tomasz Kamiński",
    email: "tomasz.kaminski@example.com",
    phone: "+48 111 222 333",
    website: "tomaszk.io",
    company: {
      name: "Code Masters",
    },
    address: {
      city: "Poznań",
      street: "ul. Stary Rynek 1",
    },
  },
  {
    id: 6,
    name: "Katarzyna Lewandowska",
    email: "katarzyna.lewandowska@example.com",
    phone: "+48 888 999 000",
    website: "katarzyna-dev.pl",
    company: {
      name: "Innovation Hub",
    },
    address: {
      city: "Łódź",
      street: "ul. Piotrkowska 104",
    },
  },
  {
    id: 7,
    name: "Michał Zieliński",
    email: "michal.zielinski@example.com",
    phone: "+48 777 888 999",
    website: "michalz.tech",
    company: {
      name: "Web Solutions",
    },
    address: {
      city: "Katowice",
      street: "ul. Mariacka 17",
    },
  },
  {
    id: 8,
    name: "Agnieszka Szymańska",
    email: "agnieszka.szymanska@example.com",
    phone: "+48 666 777 888",
    website: "agaszymania.com",
    company: {
      name: "Design Studio",
    },
    address: {
      city: "Bydgoszcz",
      street: "ul. Gdańska 25",
    },
  },
];

// GET endpoint - pobieranie wszystkich użytkowników
export const GET: APIRoute = async ({ request }) => {
  try {
    // Symulacja opóźnienia serwera (opcjonalne)
    await new Promise((resolve) => setTimeout(resolve, 500));

    let users = [...dummyUsers];

    return new Response(
      JSON.stringify({
        success: true,
        data: users,
        total: dummyUsers.length,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Error in GET /api/users:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Nie udało się pobrać użytkowników",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
