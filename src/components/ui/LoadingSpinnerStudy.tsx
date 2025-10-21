export default function LoadingSpinnerStudy() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Przygotowywanie sesji nauki...</h2>
        <p className="text-muted-foreground">Pobieranie fiszek z folderu</p>
      </div>
    </div>
  );
}
