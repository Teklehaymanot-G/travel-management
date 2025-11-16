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

-- AlterTable
ALTER TABLE `payment` MODIFY `receiptUrl` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `ticket` MODIFY `qrCodeUrl` LONGTEXT NULL;

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

-- AddForeignKey
ALTER TABLE `CommentLike` ADD CONSTRAINT `CommentLike_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentLike` ADD CONSTRAINT `CommentLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
