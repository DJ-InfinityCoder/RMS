/**
 * Utility for encoding and decoding restaurant QR codes.
 * QR data format: "RMS_RESTAURANT_<id>"
 */

const QR_PREFIX = 'RMS_RESTAURANT_';

/** Returns the QR code value string to embed in the QR image */
export const getQRValue = (restaurantId: string): string => {
    return `${QR_PREFIX}${restaurantId}`;
};

/**
 * Parses a scanned QR string. Returns the restaurant ID if valid,
 * or null if the QR does not belong to this app.
 */
export const parseQRValue = (data: string): string | null => {
    if (data.startsWith(QR_PREFIX)) {
        const id = data.replace(QR_PREFIX, '').trim();
        return id.length > 0 ? id : null;
    }
    return null;
};
