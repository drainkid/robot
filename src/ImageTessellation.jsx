import { useRef, useState } from 'react';
import { getNeighbors, Graph} from './graph.js';

function ImageTessellation() {
    const [imageUrl, setImageUrl] = useState('');
    const canvasRef = useRef(null);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [squares, setSquares] = useState([]);
    const cellSize = 25;

    console.log(startPoint);
    console.log(endPoint);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            setImageUrl(e.target.result);
        };

        reader.readAsDataURL(file);
    };

    const performTessellation = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        setStartPoint(null)
        setEndPoint(null)
        const image = new Image();
        const w = document.getElementById('width').value;
        const h = document.getElementById('height').value;

        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            setSquares(generateSquares(w, h));
        };
        image.src = imageUrl;
    };

    const handleCanvasClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedPoint = { x, y };

        // Находим квадрат, который содержит выбранную точку
        const clickedSquare = findSquareContainingPoint(clickedPoint);

        if (clickedSquare) {
            // Проверяем, является ли выбранный квадрат начальной или конечной точкой
            const ctx = canvasRef.current.getContext('2d');
            if (!startPoint) {
                ctx.fillStyle = 'rgba(0,0,255,.5)'
                ctx.fillRect(clickedSquare.x, clickedSquare.y, cellSize, cellSize)
                setStartPoint(clickedSquare);
            } else if (!endPoint) {
                ctx.fillStyle = 'rgba(255,0,0,.5)'
                ctx.fillRect(clickedSquare.x, clickedSquare.y, cellSize, cellSize)
                setEndPoint(clickedSquare);
            }
        }
    };

    const findSquareContainingPoint = (point) => {
        // Ищем квадрат, содержащий точку
        for (const square of squares) {
            const { x, y, size } = square;
            if (point.x >= x && point.x <= x + size && point.y >= y && point.y <= y + size) {
                return square;
            }
        }

        return null;
    };

    const generateSquares = (width, height) => {
        const squares = [];
        let id = 0;

        for (let x = 0; x < width; x += cellSize) {
            for (let y = 0; y < height; y += cellSize) {
                const size = cellSize;
                const colors = [];
                const AN = 1 / 8;
                const OFFSET = [[AN, AN], [AN, 1/2],[AN, 1-AN], [1/2, 1/2], [1/2, AN], [1/2, 1-AN], [1-AN, AN], [1-AN, 1/2], [1-AN, 1-AN]]
                for (const [xOff, yOff] of OFFSET) {
                    const col = getColorAtPosition(x + xOff * cellSize, y + yOff * cellSize);
                    colors.push(col.match(/\d+/g).map(Number))
                }
                const passability = calculatePassabilityFromColors(colors)
                // const passability = Math.round(Math.random() * 5);

                squares.push({ id, x, y, size, passability, neighbors: [] });
                id += 1;

            }
        }
        // Заполняем массив соседей для каждого квадрата
        squares.forEach((square) => {
            square.neighbors = getNeighbors(squares, square);
        });
        console.log(squares);

        drawSquares(canvasRef.current.getContext('2d'), squares);

        return squares;
    };

    const getColorAtPosition = (x, y) => {
        const ctx = canvasRef.current.getContext('2d');
        const pixelData = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    };


    const calculatePassabilityFromColors = (colors) => {
        const whitePixels = colors.filter(c => c.every(c => c > 250))
        if (whitePixels.length >= 3)
            return 1;

        const avgColor = colors.reduce((acc, col) => acc.map((a, i) => a + col[i] / colors.length), [0, 0, 0])
        const [red, green, blue] = avgColor
        if (red > 250 && green > 250 && blue > 250) {
            // Если цвет белый (255, 255, 255), проходимость 1
            return 1;
        } else if (red > 230 && green > 230 && blue > 230) {
            // Если цвет какой-то другой (241, 239, 234), проходимость 2
            return 5;
        } else if (red > 210 && green > 210 && blue > 210) {
            // Если цвет светло-серый (224, 223, 223), проходимость 3
            return 9;
        } else {
            // В остальных случаях проходимость по умолчанию
            return 99;
        }
    };


    const drawSquares = (ctx, squares) => {
        ctx.font = '9px Arial';
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'right'

        squares.forEach((square) => {
            const { x, y, size, passability } = square;

            ctx.beginPath();
            ctx.rect(x, y, size, size);
            ctx.stroke();

            ctx.fillText(passability.toString(), x - 4 + cellSize, y + 3);
        });
    };

    const drawPath = (ctx, path, cells) => {
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 3;

        if (Array.isArray(cells)) {
            for (let i = 0; i < path.length; i++) {
                const cellId = path[i];
                const cell = cells.find(cell => cell.id === cellId);
                if (cell) {
                    ctx.lineTo(cell.x + cellSize / 2, cell.y + cellSize / 2);
                }
            }
        } else {
            console.error("Cells is not an array or is undefined");
        }

        ctx.stroke();
    };

    const drawVisited = (graph) => {
        const ctx = canvasRef.current.getContext('2d');
        for (const [visited, fill] of [[graph.visited_s, 'rgba(80,0,255,.2)'], [graph.visited_t, 'rgba(255,80,0,.2)']]) {
            ctx.fillStyle = fill
            for (let i = 0; i < graph.V; ++i) {
                if (!visited[i])
                    continue
                ctx.fillRect(graph.squares[i].x, graph.squares[i].y, cellSize, cellSize);
            }
        }
    };



    const handleFindPath = () => {
        // Создаем объект графа с помощью существующего массива объектов squares
        const graph = new Graph(squares);

        // Вызываем двунаправленный поиск пути, передавая начальную и конечную точки
        const path = graph.biDirSearch(startPoint.id, endPoint.id);
        console.log('pt', path)
        drawVisited(graph);

        if (path) {
            // Если путь найден, отрисовываем его на холсте
            drawPath(canvasRef.current.getContext('2d'), path,squares);
        } else {
            // Если путь не найден, выводим сообщение об этом
            alert('Путь не найден');
        }
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={performTessellation}>Тесселяция</button>
            <button onClick={handleFindPath}>Поиск пути</button>
            <canvas ref={canvasRef} onClick={handleCanvasClick} />
            <p> Ширина: <input type="text" id="width" /> </p>
            <p> Высота: <input type="text" id="height" /> </p>
        </div>
    );
}

export default ImageTessellation;
