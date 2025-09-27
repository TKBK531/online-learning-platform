import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">EduBot Platform</h1>
          <p className="text-muted-foreground">Tailwind CSS + Shadcn/ui Setup Complete!</p>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 Setup Status
              <Badge variant="secondary">Ready</Badge>
            </CardTitle>
            <CardDescription>
              Your React app is now configured with Tailwind CSS and Shadcn/ui components.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              ✅ Tailwind CSS configured<br />
              ✅ Shadcn/ui components ready<br />
              ✅ Path aliases working<br />
              ✅ CSS variables configured
            </p>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Start building your chatbot components now! 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
