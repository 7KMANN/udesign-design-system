// Reference screen, task tool scenario (D-65): Today, the landing page of a task list
// ticked through all day. Operations is still the profile and the theme; the scenario
// adapts color, density and emphasis for this one kind of surface.
// Opt a region in with data-scenario="task" on its root; the --task-* tokens exist
// nowhere else. Pin the profile once on the document root: <html data-design="operations">.
// Copy the parts you need; the restraint travels with each part.
// Placeholder data: no real client, order, or date.
"use client"

import * as React from "react"
import { AlertCircle, ChevronsUp, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskCheck, type TaskCheckHue } from "@/components/ui/task-check"

type Task = { id: string; title: string; list: TaskCheckHue; overdue?: boolean; high?: boolean }
type Question = { id: string; who: string; text: string; dev?: boolean; options: { label: string; recommended?: boolean }[] }

const LIST_NAME: Record<TaskCheckHue, string> = { day: "Day-to-day", business: "Business", ideas: "Ideas", dev: "Dev" }

const initialTasks: Task[] = [
  { id: "t1", title: "Send the supplier the corrected size run", list: "business", overdue: true },
  { id: "t2", title: "Order transfer film", list: "day", high: true },
  { id: "t3", title: "Call back about the team order", list: "business" },
  { id: "t4", title: "Clean the press platen", list: "day" },
]

const initialQuestions: Question[] = [
  { id: "q1", who: "Koda", text: "The landlord wants an answer by Friday. Draft the reply now?", options: [{ label: "Draft it now", recommended: true }, { label: "Wait" }] },
  { id: "q2", who: "KASPER", dev: true, text: "Round only the final total, or keep rounding each line?", options: [{ label: "Round the total only", recommended: true }, { label: "Keep each line" }] },
]

// The scenario's timing is tokens: read it off the region root, so the code waits exactly as
// long as the CSS moves, and collapses with it under reduced motion.
function readMs(root: HTMLElement | null, name: string) {
  const raw = root ? getComputedStyle(root).getPropertyValue(name).trim() : ""
  return raw.endsWith("ms") ? parseFloat(raw) : raw.endsWith("s") ? parseFloat(raw) * 1000 : 0
}

// Hue in small marks only, always with its word (D-65): a dot beside the list's name.
function ListMark({ list }: { list: TaskCheckHue }) {
  const dot = { day: "bg-[var(--task-cat-day)]", business: "bg-[var(--task-cat-business)]", ideas: "bg-[var(--task-cat-ideas)]", dev: "bg-[var(--task-cat-dev)]" }[list]
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
      {LIST_NAME[list]}
    </span>
  )
}

function TaskRow({ task, leaving, onTick, onOpen }: { task: Task; leaving: boolean; onTick: () => void; onOpen: () => void }) {
  return (
    // The wrapper collapses; the row inside never changes height, so nothing shifts during a tick.
    <li
      data-leaving={leaving || undefined}
      className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-[var(--task-leave)] ease-[var(--motion-easing-exit)] data-[leaving]:grid-rows-[0fr] data-[leaving]:opacity-0 motion-reduce:data-[leaving]:grid-rows-[1fr]"
    >
      <div className="min-h-0 overflow-hidden">
        {/* Comfortable density: 48px rows, title at --text-h3. Two controls (D-65): the check is the
            Tab stop and Space ticks it; the title is a mouse-only button that opens the item. */}
        <div
          data-checked={leaving || undefined}
          className="grid h-[var(--task-row-height)] grid-cols-[var(--task-hit)_minmax(0,1fr)_auto] items-center rounded-[var(--task-radius)] pr-3 hover:bg-[var(--interactive-hover)]"
        >
          <TaskCheck checked={leaving} hue={task.list} aria-label={task.title} onCheckedChange={(value) => value && onTick()} />
          <button
            type="button"
            tabIndex={-1}
            onClick={onOpen}
            className="truncate text-left text-[length:var(--text-h3)] text-[var(--foreground)] line-through decoration-transparent transition-[color,text-decoration-color] duration-[var(--task-hold)] ease-[var(--motion-easing-standard)] active:bg-[var(--interactive-pressed)] [[data-checked]_&]:text-[var(--muted-foreground)] [[data-checked]_&]:decoration-current"
          >
            {task.title}
          </button>
          {/* At most two marks. The overdue treatment is the only warning use; high priority is one
              hue, top level only, always with its glyph and its words for a screen reader. */}
          <span className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <ListMark list={task.list} />
            {task.high ? (
              <span className="inline-flex text-[var(--task-priority-high)]">
                <ChevronsUp className="size-4" aria-hidden="true" />
                <span className="sr-only">High priority</span>
              </span>
            ) : null}
          </span>
        </div>
      </div>
    </li>
  )
}

function QuestionCard({ question, hue, onDone }: { question: Question; hue: TaskCheckHue; onDone: (label: string) => void }) {
  const [more, setMore] = React.useState(false)
  const edge = hue === "dev" ? "border-l-[var(--task-cat-dev)]" : "border-l-[var(--task-cat-business)]"
  const options = [...question.options].sort((a, b) => Number(Boolean(b.recommended)) - Number(Boolean(a.recommended)))
  return (
    <article aria-label={`Question from ${question.who}`} className={`grid gap-2 rounded-[var(--task-radius)] border border-l-[3px] border-[var(--border)] bg-[var(--card)] px-4 py-3 ${edge}`}>
      <span className="text-xs text-[var(--muted-foreground)]"><strong className="font-semibold text-[var(--foreground)]">{question.who}</strong> asks</span>
      <p className="m-0 text-[length:var(--text-h3)] font-medium">{question.text}</p>
      <div className="flex flex-wrap items-center gap-2">
        {/* The recommended answer comes first and is secondary; the accent is never on a repeated card. */}
        {options.map((option) =>
          option.recommended ? (
            <Button key={option.label} size="compact" variant="secondary" onClick={() => onDone(`Answered: ${option.label}`)}>
              {option.label}
              <span className="rounded border border-[var(--border-strong)] px-1 text-xs text-[var(--muted-foreground)]">Recommended</span>
            </Button>
          ) : (
            <Button key={option.label} size="compact" variant="ghost" onClick={() => onDone(`Answered: ${option.label}`)}>
              {option.label}
            </Button>
          ),
        )}
        {/* Reply, Snooze and Reject wait behind one More control. */}
        <Button size="compact" variant="ghost" aria-expanded={more} onClick={() => setMore(!more)}>
          <MoreHorizontal className="size-4" aria-hidden="true" />More
        </Button>
        {more ? (
          <span className="flex flex-wrap gap-2">
            <Button size="compact" variant="ghost" onClick={() => onDone(`Replied to ${question.who}`)}>Reply</Button>
            <Button size="compact" variant="ghost" onClick={() => onDone("Snoozed until tomorrow")}>Snooze until tomorrow</Button>
            <Button size="compact" variant="ghost" onClick={() => onDone("Rejected")}>Reject</Button>
          </span>
        ) : null}
      </div>
    </article>
  )
}

export function TaskToolToday() {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [tasks, setTasks] = React.useState(initialTasks)
  const [questions, setQuestions] = React.useState(initialQuestions)
  const [leaving, setLeaving] = React.useState<string[]>([])
  const [toast, setToast] = React.useState<{ text: string; undo: () => void } | null>(null)
  const [draft, setDraft] = React.useState("")
  const sendTimer = React.useRef<number>()

  // A change is held for the undo window and sent after it: undo inside the window sends nothing.
  const hold = (text: string, undo: () => void) => {
    window.clearTimeout(sendTimer.current)
    setToast({ text, undo })
    sendTimer.current = window.setTimeout(() => setToast(null), readMs(rootRef.current, "--task-undo-window"))
  }

  // A ticked row leaves at once: the check draws, then the row collapses out.
  const leaveTimers = React.useRef<Record<string, number>>({})
  const tick = (task: Task) => {
    setLeaving((ids) => [...ids, task.id])
    const gone = readMs(rootRef.current, "--task-hold") + readMs(rootRef.current, "--task-leave")
    leaveTimers.current[task.id] = window.setTimeout(() => {
      setTasks((list) => list.filter((t) => t.id !== task.id))
      setLeaving((ids) => ids.filter((id) => id !== task.id))
    }, gone)
    // Undo puts the row back where it was, even mid-leave.
    hold(`Done: ${task.title}`, () => {
      window.clearTimeout(leaveTimers.current[task.id])
      setLeaving((ids) => ids.filter((id) => id !== task.id))
      setTasks((list) => (list.some((t) => t.id === task.id) ? list : [...list, task].sort((a, b) => initialTasks.indexOf(a) - initialTasks.indexOf(b))))
    })
  }

  const answer = (question: Question, text: string) => {
    setQuestions((list) => list.filter((q) => q.id !== question.id))
    hold(text, () => setQuestions((list) => [...list, question].sort((a, b) => initialQuestions.indexOf(a) - initialQuestions.indexOf(b))))
  }

  const earlier = tasks.filter((t) => t.overdue)
  const today = tasks.filter((t) => !t.overdue)
  const everydayAsks = questions.filter((q) => !q.dev)
  const devAsks = questions.filter((q) => q.dev)

  const rows = (list: Task[]) => (
    <ul className="m-0 list-none p-0">
      {list.map((task) => (
        <TaskRow key={task.id} task={task} leaving={leaving.includes(task.id)} onTick={() => tick(task)} onOpen={() => undefined} />
      ))}
    </ul>
  )

  return (
    // The region root opts in. A plain container: its groups are the labelled regions.
    <div ref={rootRef} data-scenario="task" className="mx-auto grid max-w-3xl gap-6 p-4 text-[var(--foreground)]">
      <header className="grid gap-2">
        <h2 id="today-title" className="ud-h1">Today</h2>
        {/* Counts in Geist with tabular figures; codes keep mono (D-65). */}
        <p className="m-0 text-sm text-[var(--muted-foreground)] [font-variant-numeric:tabular-nums]">{questions.length} questions waiting on you</p>
      </header>

      {/* One-line capture: Enter adds at the top and keeps focus. No accent: nothing here commits work for others. */}
      <form
        className="flex items-center gap-2 rounded-[var(--task-radius)] border border-[var(--border)] bg-[var(--card)] px-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!draft.trim()) return
          setTasks((list) => [{ id: `n${Date.now()}`, title: draft.trim(), list: "day" }, ...list])
          setDraft("")
        }}
      >
        <Plus className="size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
        <Input aria-label="Add a task for today" placeholder="Add a task for today" value={draft} onChange={(event) => setDraft(event.target.value)} className="border-0 bg-transparent" />
      </form>

      {/* My tasks first. Empty groups and zero counts are not rendered. */}
      {earlier.length ? (
        <section aria-labelledby="earlier-title">
          <h3 id="earlier-title" className="ud-h3 flex items-center gap-2 text-[var(--task-overdue)]"><AlertCircle className="size-4" aria-hidden="true" />From earlier</h3>
          {rows(earlier)}
        </section>
      ) : null}
      {today.length ? (
        <section aria-labelledby="today-list-title">
          <h3 id="today-list-title" className="ud-h3">Today</h3>
          {rows(today)}
        </section>
      ) : null}

      {/* Questions below the tasks. Agents' questions on Dev items keep a block of their own. */}
      {everydayAsks.length ? (
        <section aria-labelledby="asks-title" className="grid gap-2">
          <h3 id="asks-title" className="ud-h3">Waiting on you</h3>
          {everydayAsks.map((q) => <QuestionCard key={q.id} question={q} hue="business" onDone={(text) => answer(q, text)} />)}
        </section>
      ) : null}
      {devAsks.length ? (
        <section aria-labelledby="dev-asks-title" className="grid gap-2">
          <h3 id="dev-asks-title" className="ud-h3 flex items-center gap-2"><span aria-hidden="true" className="size-2 rounded-full bg-[var(--task-cat-dev)]" />Dev questions</h3>
          {devAsks.map((q) => <QuestionCard key={q.id} question={q} hue="dev" onDone={(text) => answer(q, text)} />)}
        </section>
      ) : null}

      {/* One toast for the undo window. It is announced, never a dialog. */}
      <div role="status" aria-live="polite" className="sticky bottom-4">
        {toast ? (
          <div className="flex items-center gap-3 rounded-[var(--task-radius)] bg-[var(--surface-console)] px-4 py-2 text-[var(--surface-console-foreground)]">
            <span className="mr-auto truncate">{toast.text}</span>
            <Button
              size="compact"
              variant="secondary"
              onClick={() => {
                window.clearTimeout(sendTimer.current)
                toast.undo()
                setToast(null)
              }}
            >
              Undo
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
