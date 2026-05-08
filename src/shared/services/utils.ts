export class Utils {
    static maskPhone = (phone: string): string => {
        const digits = phone.replace(/\D/g, '')
        const visible = digits.slice(-4)
        const masked = digits.slice(0, -4).replace(/\d/g, '•')

        return `${masked}${visible}`
    }

    static getMobileOS(): 'Android' | 'iOS' | 'Other' {
        const ua = navigator.userAgent

        if (/android/i.test(ua)) {
            return 'Android'
        } else if (/iPad|iPhone|iPod/.test(ua)) {
            return 'iOS'
        }

        return 'Other'
    }
}
