.PHONY: pomoc setup start cykl podglad test lekarz wdroz czysc

pomoc:
	@echo "make setup    — instalacja zależności i pierwsze zbudowanie"
	@echo "make start    — serwer roboczy na http://localhost:8080/pl/"
	@echo "make cykl     — obrót pętli PDCA: budowa, testy, kontrole, raport"
	@echo "make podglad  — jednoplikowy podgląd do wysłania komuś"
	@echo "make test     — same testy"
	@echo "make lekarz   — diagnostyka środowiska WSL"
	@echo "make wdroz    — wdrożenie na Cloudflare Workers"
	@echo "make czysc    — usunięcie wytworzonych katalogów"

setup:
	@bash bin/wsl-setup.sh

start:
	@npm run dev

cykl:
	@npm run cykl

podglad:
	@npm run podglad

test:
	@npm test

lekarz:
	@bash bin/lekarz.sh

wdroz:
	@npm run deploy

czysc:
	@rm -rf _site _podglad .tmp src/assets/js/lib
	@echo "usunięto katalogi wytworzone przy budowaniu"
