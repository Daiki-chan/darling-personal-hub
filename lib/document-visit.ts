type DarlingWindow = Window & {
  __darlingDocumentReady?: boolean;
};

export function consumeInitialDocumentVisit() {
  const clientWindow = window as DarlingWindow;
  const isInitialVisit = clientWindow.__darlingDocumentReady !== true;

  clientWindow.__darlingDocumentReady = true;
  return isInitialVisit;
}
