import { LoggerConfig } from "src/common/logger/config/logger.config";


export function isShouldSendToTelegram(info: any): boolean {
    
    if (!LoggerConfig.telegram.enabled) return false;

    const {
        level = 'info',
        statusCode,
        message = '',
        stack = '',
    } = info;

    const levelPriority = { error: 3, warn: 2, info: 1 };
    const minLevelPriority = levelPriority[LoggerConfig.telegram.minLevel] || 3;

    const currentLevelPriority = levelPriority[level] || 0;
    const isAboveMinLevel = currentLevelPriority >= minLevelPriority;

    const hasStatusAbove = !LoggerConfig.telegram.onlyStatusAbove
        || (statusCode >= LoggerConfig.telegram.onlyStatusAbove);

    const hasCriticalKeyword = LoggerConfig.telegram.criticalKeywords.some((kw) =>
        message.includes(kw) || stack.includes(kw)
    );

    return isAboveMinLevel && (hasStatusAbove || hasCriticalKeyword);
}
