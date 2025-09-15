import React, { useState, useEffect } from 'react';
import { getLogs } from '../api/logs';
import '../css/LogPage.css'; // Мы создадим этот CSS-файл для стилизации

const LogPage = () => {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const logsData = await getLogs();
                // Сортируем логи от новых к старым
                setLogs(logsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
                setError(null);
            } catch (err) {
                setError(err.message || 'Не удалось загрузить логи.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const renderDetails = (details) => {
        if (!details) return '';

        // Для лучшей читаемости преобразуем объекты в форматированный JSON
        return <pre>{JSON.stringify(details, null, 2)}</pre>;
    };

    if (isLoading) {
        return <p>Загрузка логов...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div className="log-page-container">
            <h1>Лог изменений</h1>
            {logs.length === 0 ? (
                <p>Нет записей в логах за текущий месяц.</p>
            ) : (
                <table className="log-table">
                    <thead>
                        <tr>
                            <th>Время</th>
                            <th>Пользователь</th>
                            <th>Действие</th>
                            <th>Сущность</th>
                            <th>ID</th>
                            <th>Детали</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log, index) => (
                            <tr key={index}>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>{log.actor.username} (ID: {log.actor.id})</td>
                                <td>{log.action}</td>
                                <td>{log.entity.type}</td>
                                <td>{log.entity.id}</td>
                                <td className="details-cell">{renderDetails(log.details)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LogPage;
