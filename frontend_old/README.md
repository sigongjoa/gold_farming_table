# Frontend Usage

This simple page provides a minimal interface for managing your inventory and
checking which items you can craft. It relies on the backend Express server
running on the same origin.

Open `index.html` in a modern browser. It will fetch the inventory for user `1`
and display editable quantities. Use the "저장" buttons to update amounts, then
click "제작 가능 아이템 보기" to load craftable recipes. For each recipe you can
check which materials you are missing.
