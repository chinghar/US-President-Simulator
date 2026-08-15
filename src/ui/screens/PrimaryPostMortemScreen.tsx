import { ContestHistory } from '../components/primary/ContestHistory';
import { DelegateTracker } from '../components/primary/Standings';
import { useGameStore } from '../state/gameStore';
import { Button, Eyebrow, Rule } from '../kit';

export function PrimaryPostMortemScreen() {
  const game = useGameStore((s) => s.game);
  const resetGame = useGameStore((s) => s.resetGame);
  const acknowledgeElectionNight = useGameStore((s) => s.acknowledgeElectionNight);
  const primary = game?.primary;
  if (!game || !primary) return null;

  const player = primary.candidates.find((c) => c.isPlayer)!;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="border-l-2 border-flag bg-ink-700 p-6">
        <Eyebrow className="text-flag">Campaign over</Eyebrow>
        <h1 className="mt-1 font-display text-h1 text-paper">{game.player.name} falls short</h1>
        <p className="mt-2 text-small text-paper/70">{primary.playerEliminatedReason}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-small sm:grid-cols-3">
          <div>
            <dt className="text-paper/50">Final delegates</dt>
            <dd className="font-mono text-paper">{player.delegates}</dd>
          </div>
          <div>
            <dt className="text-paper/50">Needed to win</dt>
            <dd className="font-mono text-paper">{primary.nominationThreshold}</dd>
          </div>
          <div>
            <dt className="text-paper/50">Contests held</dt>
            <dd className="font-mono text-paper">{primary.contestsCompleted.length}</dd>
          </div>
        </dl>

        <Rule className="my-6" />

        <div className="space-y-3">
          <DelegateTracker candidates={primary.candidates} threshold={primary.nominationThreshold} />
        </div>

        <div className="mt-6 space-y-3">
          <Eyebrow>Contest history</Eyebrow>
          <ContestHistory results={primary.contestsCompleted} candidates={primary.candidates} />
        </div>

        <div className="mt-8">
          {game.governing ? (
            <Button onClick={acknowledgeElectionNight}>View your legacy</Button>
          ) : (
            <Button variant="secondary" onClick={resetGame}>
              Start a new campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
