// Struktur dasar perintah ESC/POS
const ESC = '\x1B';
const GS = '\x1D';
const CLEAN = '\x40';
const LINE_FEED = '\x0A';
const CENTER = '\x1B\x61\x01';
const LEFT = '\x1B\x61\x00';
const BOLD_ON = '\x1B\x45\x01';
const BOLD_OFF = '\x1B\x45\x00';

export const printReceipt = async (storeName, cart, total) => {
  try {
    // 1. Request Perangkat Bluetooth
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // UUID Umum Printer Thermal
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    // 2. Format Struk (Teks)
    let receiptText = `${ESC}${CLEAN}${CENTER}${BOLD_ON}${storeName}${BOLD_OFF}${LINE_FEED}`;
    receiptText += `--------------------------------${LINE_FEED}`;
    
    cart.forEach(item => {
      const line = `${item.name} x${item.qty}`.slice(0, 20);
      const price = (item.price * item.qty).toLocaleString();
      receiptText += `${LEFT}${line.padEnd(22)} ${price.padStart(8)}${LINE_FEED}`;
    });

    receiptText += `--------------------------------${LINE_FEED}`;
    receiptText += `${CENTER}${BOLD_ON}TOTAL: Rp ${total.toLocaleString()}${BOLD_OFF}${LINE_FEED}`;
    receiptText += `${CENTER}Terima Kasih!${LINE_FEED}${LINE_FEED}${LINE_FEED}`;

    // 3. Encode ke Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(receiptText);

    // 4. Kirim ke Printer
    await characteristic.writeValue(data);
    
    await device.gatt.disconnect();
    return true;
  } catch (error) {
    console.error("Printer Error:", error);
    alert("Koneksi Printer Gagal: " + error.message);
    return false;
  }
};
