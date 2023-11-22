import ModeMenu from "../components/ModeMenu";
import Stage from "../components/Stage";

export default function Home() {
  return (
    <div className="flex">
      <aside className="h-screen top-0 w-1/4">
          <p>Yo</p>
      </aside>
      <main className="h-screen top-0 w-3/4">
        <ModeMenu></ModeMenu>
        <Stage></Stage>
      </main>
    </div>
  );
}
