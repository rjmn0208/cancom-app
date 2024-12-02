import Image from "next/image";

async function AdminDashboard() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem 3rem",
          maxWidth: "450px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: "0.5rem 0",
            fontSize: "2rem",
            color: "#6153d7",
            fontWeight: "bold",
          }}
        >
          Welcome to Cancer Companion
        </h1>
        <Image
          src="/images/Mascot.png"
          alt="Admin Mascot"
          width={230}
          height={230}
          priority
          style={{
            borderRadius: "50%",
            marginBottom: "1rem",
          }}
        />
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "1.1rem",
            color: "#555",
            lineHeight: "1.5",
          }}
        >
          Navigate using the menu to manage your
          system efficiently.
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
