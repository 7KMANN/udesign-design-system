import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge as RegistryBadge } from '@/components/ui/badge';
import { Button as RegistryButton } from '@/components/ui/button';
import { Card as RegistryCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { MetricCard } from '@/components/ui/metric-card';
import { ResponsiveCollection } from '@/components/ui/responsive-collection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { StatusBadge } from '@/components/ui/status-badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TONES = [
  ['neutral', 'Neutral'],
  ['info', 'Info'],
  ['success', 'Success'],
  ['warning', 'Warning'],
  ['danger', 'Danger'],
  ['progress', 'Progress'],
  ['brand', 'Brand'],
] as const;
const ENTITIES = [1, 2, 3, 4] as const;

const SURFACES = [
  ['Raised', '--surface-raised'],
  ['Sunken', '--surface-sunken'],
  ['Overlay', '--surface-overlay'],
  ['Console', '--surface-console'],
] as const;

export function KitchenSink() {
  return (
    <div className="preview-page">
      <header className="preview-heading">
        <div>
          <p className="preview-kicker">UDesign 1.3.0</p>
          <h1>Semantic system matrix</h1>
        </div>
        <p>Every sample changes across theme and design profile without changing component code.</p>
      </header>

      <section className="preview-section" aria-labelledby="surface-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Foundation</p>
            <h2 id="surface-heading">Intentional surfaces</h2>
          </div>
          <p>Surface names describe placement, not a fixed color.</p>
        </div>
        <div className="surface-grid">
          {SURFACES.map(([label, variable]) => (
            <div key={label} className={`surface-sample surface-sample--${label.toLowerCase()}`}>
              <strong>{label}</strong>
              <code>{variable}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="preview-section" aria-labelledby="tone-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Status</p>
            <h2 id="tone-heading">Complete tone families</h2>
          </div>
          <p>Labels and markers preserve meaning without color perception.</p>
        </div>
        <div className="tone-grid">
          {TONES.map(([tone, label]) => (
            <Card key={tone} className={`tone-card tone-${tone}`}>
              <Badge variant={tone}>{tone}</Badge>
              <strong>{label} surface</strong>
              <span>Foreground, surface, and border remain paired.</span>
              <Badge variant={tone} solid>Solid treatment</Badge>
            </Card>
          ))}
        </div>
      </section>

      <section className="preview-section" aria-labelledby="entity-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Records</p>
            <h2 id="entity-heading">Entity distinction</h2>
          </div>
          <p>Each family combines a number, label, boundary, and semantic color.</p>
        </div>
        <div className="entity-grid">
          {ENTITIES.map((entity) => (
            <div key={entity} className={`entity-chip entity-${entity}`}>
              <span aria-hidden="true">{entity}</span>
              <strong>Entity family {entity}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="preview-section" aria-labelledby="registry-heading" data-testid="registry-showcase">
        <div className="section-heading">
          <div>
            <p className="section-index">Source registry</p>
            <h2 id="registry-heading">Every shipped component</h2>
          </div>
          <p>These examples import the same source used to build the public registry.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <RegistryCard>
            <CardHeader>
              <CardTitle>Actions and status</CardTitle>
              <CardDescription>Button, IconButton, Badge, StatusBadge, Tooltip, Alert, and Card.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <RegistryButton>Primary action</RegistryButton>
                <RegistryButton variant="outline" aria-pressed="true">Pressed action</RegistryButton>
                <IconButton icon={<span aria-hidden="true">+</span>} label="Add item" />
                <RegistryBadge tone="info">Information</RegistryBadge>
                <StatusBadge busy tone="progress">Loading</StatusBadge>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><RegistryButton variant="secondary">Focus for help</RegistryButton></TooltipTrigger>
                  <TooltipContent>Tooltip content uses semantic popover roles.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Alert tone="warning">
                <AlertTitle>Review required</AlertTitle>
                <AlertDescription>The alert keeps text and color meaning paired.</AlertDescription>
              </Alert>
            </CardContent>
          </RegistryCard>

          <RegistryCard>
            <CardHeader>
              <CardTitle>Fields and controls</CardTitle>
              <CardDescription>Field, Input, Textarea, Select, Checkbox, and Switch.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field>
                <FieldLabel htmlFor="registry-name">Display name</FieldLabel>
                <Input id="registry-name" aria-describedby="registry-name-help registry-name-error" aria-invalid="true" defaultValue="Sample record" />
                <FieldDescription id="registry-name-help">Use a recognizable name.</FieldDescription>
                <FieldError id="registry-name-error">Example connected error message.</FieldError>
              </Field>
              <Textarea aria-label="Notes" placeholder="Add notes" />
              <Select defaultValue="active">
                <SelectTrigger aria-label="Record state"><SelectValue placeholder="Choose a state" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2"><Checkbox defaultChecked /> Include archived</label>
                <label className="flex items-center gap-2"><Switch defaultChecked /> Live updates</label>
              </div>
            </CardContent>
          </RegistryCard>

          <RegistryCard>
            <CardHeader>
              <CardTitle>Overlays and navigation</CardTitle>
              <CardDescription>Dialog, Sheet, and Tabs preserve keyboard behavior and localized close labels.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild><RegistryButton variant="outline">Open dialog</RegistryButton></DialogTrigger>
                  <DialogContent closeLabel="Close dialog">
                    <DialogTitle>Mobile-safe dialog</DialogTitle>
                    <DialogDescription>Width, viewport height, focus, and close controls follow the shared contract.</DialogDescription>
                  </DialogContent>
                </Dialog>
                <Sheet>
                  <SheetTrigger asChild><RegistryButton variant="outline">Open sheet</RegistryButton></SheetTrigger>
                  <SheetContent closeLabel="Close sheet">
                    <SheetTitle>Responsive sheet</SheetTitle>
                    <SheetDescription>The panel is full width on mobile and bounded on larger screens.</SheetDescription>
                  </SheetContent>
                </Sheet>
              </div>
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">Overview content</TabsContent>
                <TabsContent value="activity">Activity content</TabsContent>
              </Tabs>
            </CardContent>
          </RegistryCard>

          <div className="grid gap-4">
            <MetricCard label="Conversion" value="+12.4%" detail="Positive metric semantics" tone="positive" />
            <EmptyState
              title="No matching records"
              description="EmptyState keeps recovery guidance beside the empty result."
              action={<RegistryButton variant="secondary">Reset filters</RegistryButton>}
            />
          </div>
        </div>

        <ResponsiveCollection
          desktop={(
            <Table scrollLabel="Registry collection example">
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>State</TableHead></TableRow></TableHeader>
              <TableBody><TableRow><TableCell>Source-owned component</TableCell><TableCell>Ready</TableCell></TableRow></TableBody>
            </Table>
          )}
          mobile={<RegistryCard><CardContent className="p-4"><strong>Source-owned component</strong><p>Ready</p></CardContent></RegistryCard>}
        />
      </section>

      <section className="preview-section" aria-labelledby="action-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Interaction</p>
            <h2 id="action-heading">Focus, selection, and disabled state</h2>
          </div>
          <p>Use Tab to inspect the focus indicator in all four profile combinations.</p>
        </div>
        <div className="action-row">
          <Button>Save changes</Button>
          <Button variant="secondary">Compare profiles</Button>
          <Button variant="outline">Open details</Button>
          <Button disabled>Unavailable</Button>
          <button type="button" className="touch-sample" aria-label="Add item">+</button>
        </div>
        <div className="selection-row" role="group" aria-label="Selection example">
          <button type="button" aria-pressed="false">Not selected</button>
          <button type="button" aria-pressed="true">Selected</button>
          <span>Minimum target: <code>--touch-target-min</code></span>
        </div>
      </section>

      <section className="preview-section" aria-labelledby="responsive-heading">
        <div className="section-heading">
          <div>
            <p className="section-index">Mobile contract</p>
            <h2 id="responsive-heading">Responsive constraints</h2>
          </div>
          <p>Switch the preview to 375px and confirm that controls remain reachable.</p>
        </div>
        <Card surface="sunken" className="responsive-token-list">
          <code>--control-height</code>
          <code>--content-gutter-mobile</code>
          <code>--dialog-inline-size-mobile</code>
          <code>--dialog-block-size-max</code>
          <code>--safe-area-bottom</code>
        </Card>
      </section>
    </div>
  );
}
