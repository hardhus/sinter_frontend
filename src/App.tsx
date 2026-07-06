import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "./context/ThemeContext";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const { theme, colorMode, setTheme, toggleColorMode } = useTheme();

  console.log(colorMode);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="px-2 py-1 text-sm border rounded-md bg-background text-foreground"
            >
              <option value="default">Varsayılan</option>
              <option value="jinx">Jinx</option>
              <option value="realmorphism">Real Morphism</option>
            </select>
            <Button variant="outline" size="sm" onClick={toggleColorMode}>
              {colorMode === "dark" ? "☀️" : "🌙"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <img src="/vite.svg" className="h-16 w-16" alt="Vite logo" />
            <p className="text-sm text-muted-foreground">Tauri + React + shadcn/ui</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); greet(); }} className="flex flex-col gap-3">
            <Input
              placeholder="Adınızı girin..."
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full">Selamla</Button>
          </form>

          {greetMsg && (
            <div className="mt-2 p-3 rounded-md bg-muted text-center">
              <p className="text-sm font-medium">{greetMsg}</p>
            </div>
          )}

          <div className="flex justify-center gap-4 text-xs text-muted-foreground">
            <a href="https://vite.dev" target="_blank" className="hover:underline">Vite</a>
            <a href="https://tauri.app" target="_blank" className="hover:underline">Tauri</a>
            <a href="https://react.dev" target="_blank" className="hover:underline">React</a>
            <a href="https://ui.shadcn.com" target="_blank" className="hover:underline">shadcn/ui</a>
          </div>
        </CardContent>
      </Card>
    </main>
  );

  // return (
  //   <main className="container">
  //     <h1>Welcome to Tauri + React</h1>

  //     <div className="row">
  //       <a href="https://vite.dev" target="_blank">
  //         <img src="/vite.svg" className="logo vite" alt="Vite logo" />
  //       </a>
  //       <a href="https://tauri.app" target="_blank">
  //         <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <p>Click on the Tauri, Vite, and React logos to learn more.</p>

  //     <form
  //       className="row"
  //       onSubmit={(e) => {
  //         e.preventDefault();
  //         greet();
  //       }}
  //     >
  //       <input
  //         id="greet-input"
  //         onChange={(e) => setName(e.currentTarget.value)}
  //         placeholder="Enter a name..."
  //       />
  //       <button type="submit">Greet</button>
  //     </form>
  //     <p>{greetMsg}</p>
  //   </main>
  // );
}

export default App;
