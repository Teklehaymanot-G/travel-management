-- DropIndex
DROP INDEX `Booking_travelId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `Booking_travelerId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `Comment_travelId_fkey` ON `comment`;

-- DropIndex
DROP INDEX `Comment_travelerId_fkey` ON `comment`;

-- DropIndex
DROP INDEX `Payment_approvedById_fkey` ON `payment`;

-- DropIndex
DROP INDEX `Ticket_bookingId_fkey` ON `ticket`;

-- DropIndex
DROP INDEX `Ticket_checkedInById_fkey` ON `ticket`;

-- DropIndex
DROP INDEX `Travel_createdById_fkey` ON `travel`;

-- DropIndex
DROP INDEX `TravelDocument_travelId_fkey` ON `traveldocument`;

-- CreateTable
CREATE TABLE `Otp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(16) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Otp_phone_purpose_expiresAt_idx`(`phone`, `purpose`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Travel` ADD CONSTRAINT `Travel_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_travelerId_fkey` FOREIGN KEY (`travelerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_checkedInById_fkey` FOREIGN KEY (`checkedInById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TravelDocument` ADD CONSTRAINT `TravelDocument_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_travelerId_fkey` FOREIGN KEY (`travelerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
