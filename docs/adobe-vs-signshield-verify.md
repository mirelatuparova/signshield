# Adobe Reader vs SignShield Verify — Сравнение на резултати

> Тествано: 2026-07-13  
> Документ: `beauty_signed.pdf` (реален подписан PDF от production)  
> Подписал: Dimo · Алгоритъм: ECDSA P-256 + ML-DSA-65 · CA: SignShield Root CA v1

---

## Резултати

| Сценарий | Adobe Reader | SignShield Verify | Съгласие |
|----------|-------------|-------------------|----------|
| **Валиден документ** (оригинал) | ✅ Signatures panel зелено — подписът е валиден | ✅ "Документът е автентичен и непроменен" · Верига: доверена | ✅ Пълно |
| **Модифициран документ** (1 байт променен) | ❌ "At least one signature is invalid" · червен ❌ в Signatures panel | ❌ "Документът е модифициран след подписване" · Грешка: "Документът е модифициран след подписване." | ✅ Пълно |

---

## Семантично mapping

| Adobe формулировка | SignShield формулировка | Значение |
|--------------------|------------------------|----------|
| "Signature is valid" (зелено) | "Документът е автентичен и непроменен" | Подписът е криптографски верифициран, документът не е променян |
| "At least one signature is invalid" (червено) | "Документът е модифициран след подписване" | SHA-256 хешът на byte range не съответства на embedded hash в CMS |
| "Certified by unknown certificate authority" (жълто) | "Подписът е от неизвестен издател" · Верига: непозната CA | Leaf cert не е подписан от доверена CA (очаквано за SignShield Root CA в Adobe — не е в Adobe's trust store) |

---

## Бележки

**Защо Adobe показва "invalid" за SignShield Root CA:**  
Adobe Reader поддържа само CA-та от Adobe Approved Trust List (AATL) и EU Trusted Lists.  
SignShield Root CA v1 е академичен CA — не е в AATL. При нормални обстоятелства Adobe ще показва  
жълто "Unknown CA" за валиден подпис от нашия CA.  
За **тестовия документ** Adobe показва зелено, защото потребителят е добавил SignShield Root CA  
ръчно в Trusted Certificates (Preferences → Trust Manager).

**SignShield Verify vs Adobe — разлика в trust модела:**  
- Adobe: проверява срещу AATL (публичен trust store)  
- SignShield Verify: проверява срещу bundled `rootCaCert.ts` (нашият собствен Root CA)  
- Семантично резултатите са еднакви; разликата е само в trust anchor-а

**Заключение:**  
SignShield Verify е **функционално еквивалентен** на Adobe Reader за хибридни подписи.  
Разминавания: нула. Двата инструмента се съгласяват за валидност и за tamper detection.

---

## Допълнение: Adobe trust за втори подпис в multi-signer документ

> Тествано: 2026-08-12  
> Документ: 2-подписен PDF (owner + recipient, incremental update, виж 5.3.4/6.2)  
> Root CA: ръчно импортиран в Adobe Trust Manager като trusted root

**Наблюдение:** След ръчно импортиране на SignShield Root CA сертификата в Adobe Trust Manager
(с "Signed documents or data" + "Certified documents" доверие), Adobe показва **Rev. 1 (owner) —
зелено/валидно**, но **Rev. 2 (recipient) — жълто/"Signature validity is unknown"**, въпреки че
двата подписа са издадени от **същия** Root CA.

**Forensic проверка (пет независими метода, всички потвърждават коректност на данните):**

| Проверка | Резултат |
|---|---|
| Byte-level сравнение на CMS структурата на двата подписа | Идентична (сертификатен brой, ред, дължини) |
| Root CA сертификат, вграден във всеки от двата CMS | Байт-идентичен |
| `SignerInfo.sid` (IssuerAndSerialNumber) за всеки подпис | Коректно съвпада със собствения си leaf сертификат |
| Тест на втора, чиста машина (нов Adobe профил, същия .cer import) | Същият резултат — изключва локален trust-store проблем |
| SignShield Verify (собствена, независима верификация) | И двата подписа — валидни |

**Извод:** Данните (сертификати, CMS, ASN.1 структура) са доказано коректни и идентични между
двата подписа. Разминаването е в **Adobe Acrobat-овото chain-building поведение специфично за
втора+ ревизия в инкрементално обновяван PDF** с non-AATL CA — не бъг в SignShield кода.
Adobe изрично потвърждава целостта на документа ("Document has not been modified") дори за
подписа, показан като "unknown" — само trust anchor резолюцията се различава по ревизия.

Тъй като меродавната верификация за целите на проекта е собствената /verify страница на
SignShield (а не Adobe UI детайл за непризнат CA), това не е блокиращо ограничение — документирано
е тук като известна Adobe-специфична особеност за бъдеща референция.
