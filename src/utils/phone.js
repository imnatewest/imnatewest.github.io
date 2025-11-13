export const telHref = (phone) => (phone ? `tel:${phone.replace(/[^0-9]/g, '')}` : undefined)
