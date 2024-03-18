import { useRef, useState } from 'react';
import { getNeighbors, Graph} from './bbfs.js';

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
            if (!startPoint) {
                setStartPoint(clickedSquare);
            } else if (!endPoint) {
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
                const passabilityColor = getColorAtPosition(x + size / 2, y + size / 2);
                const passability = calculatePassabilityFromColor(passabilityColor);

                id += 1;
                squares.push({ id, x, y, size, passability, neighbors: [] });

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

    const calculatePassabilityFromColor = (color) => {
        // Разбиваем строку цвета и извлекаем значения красного, зеленого и синего каналов
        const [red, green, blue] = color.match(/\d+/g).map(Number);

        // Пример логики для определения проходимости в зависимости от значений каналов цвета
        if (red === 255 && green === 255 && blue === 255) {
            // Если цвет белый (255, 255, 255), проходимость 1
            return 1;
        } else if (red === 224 && green === 223 && blue === 223) {
            // Если цвет светло-серый (224, 223, 223), проходимость 3
            return 3;
        } else if (red === 241 && green === 239 && blue === 234) {
            // Если цвет какой-то другой (241, 239, 234), проходимость 2
            return 2;
        } else {
            // В остальных случаях проходимость по умолчанию
            return 1;
        }
    };


    const drawSquares = (ctx, squares) => {
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';

        squares.forEach((square, index) => {
            const { x, y, size, passability } = square;

            ctx.beginPath();
            ctx.rect(x, y, size, size);
            ctx.stroke();

            ctx.fillText(passability.toString(), x + size / 2, y + size / 2);
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



    const handleFindPath = () => {
        // Создаем объект графа с помощью существующего массива объектов squares
        const graph = new Graph(squares);

        // Вызываем двунаправленный поиск пути, передавая начальную и конечную точки
        const path = graph.biDirSearch(startPoint.id, endPoint.id);
        console.log('pt', path)

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
