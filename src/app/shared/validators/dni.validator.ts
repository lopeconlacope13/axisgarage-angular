/**
 * Validador de DNI español.
 * Algoritmo oficial: los 8 primeros dígitos se dividen entre 23
 * y el resto indica la letra correspondiente en la tabla fija.
 * Formato esperado: NNNNNNNNL (8 números + letra).
 */

const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

/**
 * Valida un DNI español comprobando formato y letra de control.
 * @param dni Cadena a validar (ej: '12345678Z').
 * @returns true si es válido, false en cualquier otro caso.
 */
export function validateDni(dni: string): boolean {
  if (!dni || !/^[0-9]{8}[A-Za-z]$/.test(dni)) {
    return false;
  }
  const numero = parseInt(dni.substring(0, 8), 10);
  const letraEsperada = LETRAS_DNI.charAt(numero % 23);
  return letraEsperada === dni.charAt(8).toUpperCase();
}
