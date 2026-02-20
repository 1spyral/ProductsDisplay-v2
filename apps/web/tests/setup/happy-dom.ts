import { GlobalRegistrator } from "@happy-dom/global-registrator";

export function registerHappyDom(): void {
    if (!GlobalRegistrator.isRegistered) {
        GlobalRegistrator.register();
    }
}

export function unregisterHappyDom(): void {
    if (GlobalRegistrator.isRegistered) {
        GlobalRegistrator.unregister();
    }
}
