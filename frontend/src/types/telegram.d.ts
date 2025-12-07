// Типы для Telegram WebApp
interface WebAppUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

interface WebAppInitData {
  query_id?: string
  user?: WebAppUser
  receiver?: WebAppUser
  start_param?: string
  auth_date: number
  hash: string
}

interface WebAppThemeParams {
  bg_color: string
  text_color: string
  hint_color: string
  link_color: string
  button_color: string
  button_text_color: string
  secondary_bg_color: string
}

interface WebApp {
  initData: string
  initDataUnsafe: WebAppInitData
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: WebAppThemeParams
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string

  // Методы
  ready(): void
  expand(): void
  close(): void
  sendData(data: string): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  openInvoice(url: string, callback?: (status: string) => void): void
  showPopup(params: { title: string; message: string; buttons?: Array<{id: string; type: string; text: string}> }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  enableClosingConfirmation(): void
  disableClosingConfirmation(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
}

// Добавляем Telegram в глобальное окно
declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp
    }
  }
}

export {}