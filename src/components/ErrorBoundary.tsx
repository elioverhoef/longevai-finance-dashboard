import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, info)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-background flex items-center justify-center p-6">
          <Card className="max-w-xl w-full shadow-card">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">Something went wrong</h2>
                  <p className="text-muted-foreground">An unexpected error occurred while rendering the dashboard.</p>
                </div>
              </div>

              {this.state.error?.message && (
                <pre className="bg-muted/50 p-3 rounded-md text-sm overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleReload} className="gap-2">
                  <RefreshCw className="w-4 h-4" /> Reload
                </Button>
                <a href="/" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto gap-2">
                    <Home className="w-4 h-4" /> Go Home
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 